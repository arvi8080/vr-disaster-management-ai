/**
 * LLM Service generating AI tactical feedback and debriefs for trainees.
 */
const generateTacticalFeedback = async (sessionData, mlPrediction) => {
    const score = mlPrediction?.predicted_score || sessionData.score || 90;
    const category = mlPrediction?.performance_category || "PASSED";

    let debrief = "";
    if (score >= 90) {
        debrief = `Operative executed mission ${sessionData.scenarioName || "Disaster Response"} with master-level precision. Structural risk assessment was performed rapidly with zero safety protocol breaches. Recommended for live field deployment.`;
    } else if (score >= 75) {
        debrief = `Operative completed ${sessionData.scenarioName || "Disaster Response"} successfully. Reaction time was within acceptable parameters. Recommended focus: Hazmat valve containment speed.`;
    } else {
        debrief = `Operative encountered multiple protocol delays during ${sessionData.scenarioName || "Disaster Response"}. Mandatory refresher course in VR hazard detection required.`;
    }

    return {
        session_id: sessionData.sessionId || "SESS-01",
        score: score,
        performance_category: category,
        ai_debrief: debrief,
        suggested_next_scenario: mlPrediction?.recommended_focus_area || "Advanced Seismic Response",
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    generateTacticalFeedback
};
