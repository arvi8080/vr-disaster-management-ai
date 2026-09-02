class User {
    constructor({ uid, email, fullName, role = "user", specialization = "Search & Rescue" }) {
        this.uid = uid;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.specialization = specialization;
        this.createdAt = new Date().toISOString();
    }

    toJSON() {
        return {
            uid: this.uid,
            email: this.email,
            fullName: this.fullName,
            role: this.role,
            specialization: this.specialization,
            createdAt: this.createdAt
        };
    }
}

module.exports = User;
