const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const DB_PATH = path.join(__dirname, "db", "db.json");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter your registered student email: ", (email) => {
    rl.question("Enter your new password (at least 8 characters): ", async (password) => {
        try {
            if (password.length < 8) {
                console.log("Password must have at least 8 characters.");
                rl.close();
                return;
            }

            const db = JSON.parse(
                fs.readFileSync(DB_PATH, "utf8")
            );

            const student = db.users.find(
                (user) =>
                    user.email.toLowerCase() === email.trim().toLowerCase() &&
                    user.role === "student"
            );

            if (!student) {
                console.log(
                    "Student account not found. Please register a new account."
                );
                rl.close();
                return;
            }

            student.passwordHash = await bcrypt.hash(password, 10);

            fs.writeFileSync(
                DB_PATH,
                JSON.stringify(db, null, 2),
                "utf8"
            );

            console.log("Student password reset successfully!");
            console.log("You can now log in using your new password.");
        } catch (error) {
            console.error("Password reset failed:", error.message);
        } finally {
            rl.close();
        }
    });
});