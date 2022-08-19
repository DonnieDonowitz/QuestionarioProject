'use strict';

const sqlite = require('sqlite3');

const db = new sqlite.Database('surveys.db', (err) => {
    if(err) throw err;
});

exports.getSurveysInfo = () => {
    return new Promise((res, rej) => {
        const sql = "SELECT * FROM Surveys;";

        db.all(sql, (err, rows) => {
            if(err){
                rej(err);
                return;
            }

            if(rows === undefined || rows.length === 0){
                res({ error: "No surveys found", survey: [] });
            }

            const surveys = rows.map((s) => { return { id: s.ID, title: s.Title, admin: s.AdminID, numsub: s.NumSubmissions }; });
            res(surveys);
        });
    });
};

exports.getSurveyByID = (id) => {
    return new Promise((res, rej) => {
        const sql = "SELECT ID, Title, NumSubmissions FROM Surveys WHERE ID = ?;";
        db.all(sql, [id], (err, row) => {
            if(err){
                rej(err);
                return;
            }

            if(row === undefined || row === [] || row.length === 0){
                res({ error: "Cannot find the requested survey", survey: [] });
                return;
            }

            const surv = { id: row[0].ID, title: row[0].Title, numsubs: row[0].NumSubmissions };

            let sqlOQ = "SELECT ID, QuestionText, isOptional, OrderNumber FROM OpenQuestions WHERE SurveyID = ?;";
            db.all(sqlOQ, [surv.id], (err, rowsOQ) => {
                if(err){
                    rej(err);
                    return;
                }

                if(rowsOQ.length === 0 || rowsOQ === [] || rowsOQ === undefined){
                    return;
                }

                const openQuestions = rowsOQ.map(oq => { return { id: oq.ID, text: oq.QuestionText, optional: oq.isOptional, order: oq.OrderNumber, closed: 0 }; });

                let sqlMCQ = "SELECT ID, QuestionText, MaxAnswers, MinAnswers, OrderNumber FROM MultipleChoiceQuestions WHERE SurveyID = ?;";
                db.all(sqlMCQ, [id], (err, rowsMCQ) => {
                    if(err){
                        rej(err);
                        return;
                    }

                    if(rowsMCQ.length === 0 || rowsMCQ === undefined || rowsMCQ === []){
                        return;
                    }
                    
                    const multipleChoiceQuestions = rowsMCQ.map(mcq => { return { id: mcq.ID, text: mcq.QuestionText, min: mcq.MinAnswers, max: mcq.MaxAnswers, order: mcq.OrderNumber, closed: 1, answers: [] }; });

                    if(multipleChoiceQuestions !== undefined){
                        let sqlAns = "SELECT * FROM MultipleChoiceAnswers;";
                        db.all(sqlAns, [], (err, rowsA) => {
                            if(err){
                                rej(err);
                                return;
                            }

                            if(rowsA.length === 0 || rowsA === undefined || rowsA === []){
                                res({ error: "No answers for a multiple choice question!", answers: [] });
                                return;
                            }
                            multipleChoiceQuestions.forEach(mcq => {
                                mcq.answers = rowsA.filter(r => r.QuestionID === mcq.id).map(a => { return { id: a.ID, text: a.AnswerText }; });
                            });
                            res({ survey: surv, openquest: openQuestions, closequest: multipleChoiceQuestions });
                        });    
                    }
                });

            });
        });
    });
};

exports.getSubmissionsBySurveyID = (id) => {
    return new Promise((res, rej) => {

        const sql = "SELECT ID, Username FROM Submissions WHERE SurveyID = ?;";
        db.all(sql, [id], (err, rows) => {
            if(err){
                rej(err);
                return;
            }

            if(rows.length === 0 || rows === [] || rows === undefined){
                res({ error: "No users have submitted this survey yet!" });
                return;
            }

            const users = rows.map(r => { return { id: r.ID, user: r.Username, openquest: [], closequest: [] };});

            const sqlOQ = "SELECT * FROM UserOpenQuestionsSubmissions;";
            db.all(sqlOQ, [], (err, rowsOQ) => {
                if(err){
                    rej(err);
                    return;
                }

                if(rowsOQ === undefined || rowsOQ.length === 0 || rowsOQ === []){
                    return;
                }

                const openQuestions = rowsOQ;

                const sqlMCQ = "SELECT * FROM UserMultipleChoiceAnswers;";
                    db.all(sqlMCQ, [], (err, rowsMCQ) => {
                        if(err){
                            rej(err);
                            return;
                        }

                        if(rowsMCQ === undefined || rowsMCQ.length === 0 || rowsMCQ === []){
                            return;
                        }

                        const multipleChoiceQuestions = rowsMCQ;

                        users.forEach(u => {
                            u.openquest = openQuestions.filter(oq => oq.SubmissionID === u.id).map(oq => { return { id: oq.QuestionID, closed: 0, answer: oq.Answer }; });
                            u.closequest = multipleChoiceQuestions.filter(mcq => mcq.SubmissionID === u.id).map(mcq => { return { id: mcq.QuestionID, closed: 1, answer: mcq.AnswerID }});
                        });

                        res(users);
                    });
            
            });
        });
    });
};

exports.submitSurvey = (surv) => {
    return new Promise((res, rej) => {
        const user = surv.username;
        const id = surv.id;

        const sql = "INSERT INTO Submissions(Username, SurveyID) VALUES (?,?);";
        db.run(sql, [user, id], function (err) {
            if(err){
                rej(err);
                return;
            }

            const subid = this.lastID;
            const sqlOQ = "INSERT INTO UserOpenQuestionsSubmissions(SubmissionID, QuestionID, Answer) VALUES (?, ?, ?);";
            surv.openquest.forEach((oq) => {
                db.run(sqlOQ, [subid, oq.id, oq.answer], function(err) {
                    if(err){
                        rej(err);
                        return;
                    }
                });
            });
    
            const sqlMCQ = "INSERT INTO UserMultipleChoiceAnswers(SubmissionID, QuestionID, AnswerID) VALUES (?, ?, ?);";
            surv.closequest.forEach((mcq) => {
                mcq.answers.forEach(a => {
                    db.run(sqlMCQ, [subid, mcq.id, a.id], function (err) {
                        if(err){
                            rej(err);
                            return;
                        }
                    });
                });
            });
        });

        const updateSubNum = "UPDATE Surveys SET NumSubmissions = NumSubmissions + 1 WHERE ID = ?;";
        db.run(updateSubNum, [surv.id], function (err) {
            if(err){
                rej(err);
                return;
            }
        });

        res({ survey: surv });
    });
};

exports.createSurvey = (surv) => {
    return new Promise((res, rej) => {
        const sqlIns = "INSERT INTO Surveys(AdminID, Title, NumSubmissions) VALUES (?, ?, ?);";
        db.run(sqlIns, [surv.admin, surv.title, 0], function (err) {
            if(err){
                rej(err);
                return;
            }
            const lastSurveyID = this.lastID;

            const sqlMCQ = "INSERT INTO MultipleChoiceQuestions(SurveyID, QuestionText, MaxAnswers, MinAnswers, OrderNumber) VALUES (?, ?, ?, ?, ?);";
            const sqlAns = "INSERT INTO MultipleChoiceAnswers(QuestionID, AnswerText) VALUES (?, ?);";
            surv.closequest.forEach((mcq) => {
                    db.run(sqlMCQ, [lastSurveyID, mcq.text, mcq.max, mcq.min, mcq.order], function (err) { 
                        if(err){
                            rej(err);
                            return;
                        }
                        const lastMCQuestionID = this.lastID;
    
                        mcq.answers.forEach((ans) => {
                            db.run(sqlAns, [lastMCQuestionID, ans.text], function (err) {
                                if(err){
                                    rej(err);
                                    return;
                                }
                            });
                        });
                    });               
            });
    
            const sqlOQ = "INSERT INTO OpenQuestions(SurveyID, QuestionText, isOptional, OrderNumber) VALUES (?, ?, ?, ?);";
            surv.openquest.forEach((oq) => {
                db.run(sqlOQ, [lastSurveyID, oq.text, oq.optional, oq.order], function (err) {
                    if(err){
                        rej(err);
                        return;
                    }
                });
            });
            res({ survey: surv });
        });       
    });
};