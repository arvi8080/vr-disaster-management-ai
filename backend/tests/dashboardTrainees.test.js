const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { getTrainerAssignedTrainees } = require("../src/controllers/dashboardController");

function createUsersFirestore(documents) {
    return {
        collection(name) {
            assert.equal(name, "users");
            return {
                where(field, operator, value) {
                    const filters = [[field, operator, value]];
                    return {
                        async get() {
                            const docs = [];
                            for (const [id, data] of Object.entries(documents)) {
                                if (filters.every(([filterField, filterOperator, filterValue]) =>
                                    filterOperator === "==" && data[filterField] === filterValue
                                )) {
                                    docs.push({ id, data: () => data });
                                }
                            }
                            return { docs, forEach: callback => docs.forEach(callback) };
                        }
                    };
                },
                doc(id) {
                    return {
                        async get() {
                            const data = documents[id];
                            return { id, exists: Boolean(data), data: () => data };
                        }
                    };
                }
            };
        }
    };
}

describe("Trainer dashboard assigned trainees", () => {
    test("includes trainees indexed by either side of the existing trainer relationship", async () => {
        const database = createUsersFirestore({
            "trainer-1": {
                role: "trainer",
                assignedTraineeIds: ["indexed-trainee", "transferred-trainee", "not-a-trainee", "missing-trainee"]
            },
            "direct-trainee": {
                role: "trainee",
                name: "Direct Match",
                assignedTrainerId: "trainer-1"
            },
            "direct-trainer-role": {
                role: "trainer",
                assignedTrainerId: "trainer-1"
            },
            "indexed-trainee": {
                role: "trainee",
                name: "Indexed Match",
                email: "indexed@example.invalid"
            },
            "transferred-trainee": {
                role: "trainee",
                assignedTrainerId: "trainer-2"
            },
            "not-a-trainee": {
                role: "trainer"
            },
            "unrelated-trainee": {
                role: "trainee",
                assignedTrainerId: "trainer-2"
            }
        });

        const trainees = await getTrainerAssignedTrainees(database, "trainer-1");

        assert.deepEqual(trainees.map(trainee => trainee.uid).sort(), [
            "direct-trainee",
            "indexed-trainee"
        ]);
        assert.equal(trainees.find(trainee => trainee.uid === "indexed-trainee").email, "indexed@example.invalid");
    });

    test("returns no trainees when the trainer has no linked trainee records", async () => {
        const database = createUsersFirestore({
            "trainer-1": { role: "trainer", assignedTraineeIds: [] },
            "unrelated-trainee": { role: "trainee", assignedTrainerId: "trainer-2" }
        });

        assert.deepEqual(await getTrainerAssignedTrainees(database, "trainer-1"), []);
    });
});
