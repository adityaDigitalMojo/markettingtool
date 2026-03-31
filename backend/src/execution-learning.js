const { db } = require('./firebaseClient');

/**
 * ExecutionLearningEngine
 * 
 * Tracks marketing actions and their subsequent performance impact.
 * Snapshots are taken at T=0, T+3d, T+7d, and T+14d.
 */
class ExecutionLearningEngine {
    constructor() {
        this.collection = 'executions';
    }

    /**
     * Record a new execution with a strategic rationale and "before" metrics.
     */
    async recordExecution({ clientId, platform, entityId, entityType, action, rationale, beforeMetrics }) {
        try {
            if (!db) throw new Error("Database not connected");

            const executionDoc = {
                clientId,
                platform,
                entityId,
                entityType,
                action,
                rationale,
                timestamp: new Date(),
                beforeMetrics: {
                    cpl: beforeMetrics.cpl || 0,
                    spend: beforeMetrics.spend || 0,
                    leads: beforeMetrics.leads || 0,
                    ctr: beforeMetrics.ctr || 0,
                    dateRange: beforeMetrics.dateRange || 'LAST_7_DAYS'
                },
                tracking: {
                    day3: { pending: true },
                    day7: { pending: true },
                    day14: { pending: true }
                },
                status: 'PENDING_OUTCOME'
            };

            const docRef = await db.collection(this.collection).add(executionDoc);
            console.log(`[LearningEngine] Recorded execution ${docRef.id} for ${entityId}`);
            return docRef.id;
        } catch (err) {
            console.error("[LearningEngine] Error recording execution:", err);
            throw err;
        }
    }

    /**
     * Update outcomes for pending executions.
     * This would typically be called by a cron job or a manual trigger.
     */
    async updateOutcomes(googleService, metaService) {
        try {
            const snapshot = await db.collection(this.collection)
                .where('status', '==', 'PENDING_OUTCOME')
                .get();

            if (snapshot.empty) return { updated: 0 };

            const now = new Date();
            let updatedCount = 0;

            for (const doc of snapshot.docs) {
                const data = doc.data();
                const executionDate = data.timestamp.toDate();
                const diffDays = Math.floor((now - executionDate) / (1000 * 60 * 60 * 24));

                let milestone = null;
                if (diffDays >= 14 && data.tracking.day14.pending) milestone = 'day14';
                else if (diffDays >= 7 && data.tracking.day7.pending) milestone = 'day7';
                else if (diffDays >= 3 && data.tracking.day3.pending) milestone = 'day3';

                if (milestone) {
                    const currentMetrics = await this.getCurrentMetrics(data, googleService, metaService);
                    if (currentMetrics) {
                        const outcome = this.calculateOutcome(data.beforeMetrics, currentMetrics);
                        
                        const update = {};
                        update[`tracking.${milestone}`] = {
                            pending: false,
                            timestamp: now,
                            metrics: currentMetrics,
                            outcome: outcome
                        };

                        // If it's the final milestone, mark as completed
                        if (milestone === 'day14') {
                            update.status = 'COMPLETED';
                            update.finalOutcome = outcome;
                        }

                        await doc.ref.update(update);
                        updatedCount++;
                    }
                }
            }

            return { updated: updatedCount };
        } catch (err) {
            console.error("[LearningEngine] Error updating outcomes:", err);
            throw err;
        }
    }

    async getCurrentMetrics(executionData, googleService, metaService) {
        // Logic to fetch current metrics for the specific entity
        // This requires platform-specific service calls
        // For now, returning null as a placeholder
        return null; 
    }

    calculateOutcome(before, after) {
        const cplImprovement = before.cpl > 0 ? (before.cpl - after.cpl) / before.cpl : 0;
        
        if (cplImprovement > 0.1) return 'POSITIVE';
        if (cplImprovement < -0.1) return 'NEGATIVE';
        return 'NEUTRAL';
    }

    async getExecutionLogs(clientId) {
        try {
            const snapshot = await db.collection(this.collection)
                .where('clientId', '==', clientId)
                .orderBy('timestamp', 'desc')
                .limit(50)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (err) {
            console.error("[LearningEngine] Error fetching logs:", err);
            return [];
        }
    }
}

module.exports = new ExecutionLearningEngine();
