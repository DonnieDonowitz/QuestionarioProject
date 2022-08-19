'use strict';

const express = require('express');
const morgan = require('morgan');
const { validationResult, checkSchema } = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const adminDbi = require('./adminDB.js');
const dbi = require('./dbi.js');
 
const app = new express();
const port = 3001;

passport.use(new LocalStrategy(
  function (username, password, done){
    adminDbi.getAdmin(username, password).then((admin) => {
      if(!admin){
        return done(null, false, { error: "Incorrect username and/or password." });
      }
      return done(null, admin);
    });
  }
));

passport.serializeUser((admin, done) => {
  done(null, admin.id);
});

passport.deserializeUser((id, done) => {
  adminDbi.getAdminByID(id).then((admin) => { done(null, admin); }).catch((err) => { done(err, null); });
}); 

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  return res.status(401).json({ error: "You must be authenticated!" });
};

app.use(morgan('dev'));
app.use(express.json());
app.use(session({
  secret: "a secret sentence not to share with anybody and anywhere, used to sign the session ID cookie",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const surveySchema = {
  title: {
    isString: true,
    notEmpty: true,
    errorMessage: "Survey must have a name!"
  },
  "openquest.*.text": {
    isString: true,
    notEmpty: true,
    errorMessage: "Open Questions must have a text!"
  },
  "openquest.*.optional": {
    isInt: true,
    notEmpty: true,
    errorMessage: "Open Questions must be either optional or not!"
  },
  "openquest.*.order": {
    isInt: true,
    notEmpty: true,
    errorMessage: "Open Questions must have a position in the Survey!"
  },
  "closequest.*.text": {
    isString: true,
    notEmpty: true,
    errorMessage: "Multiple Choice Questions must have a text!"
  },
  "closequest.*.max": {
    isInt: true,
    notEmpty: true,
    errorMessage: "Multiple Choice Questions must specify the maximum answers allowed!"
  },
  "closequest.*.min": {
    isInt: true,
    notEmpty: true,
    errorMessage: "Multiple Choice Questions must specify the minimum answers allowed!"
  },
  "closequest.*.order": {
    isInt: true,
    notEmpty: true,
    errorMessage: "Multiple Choice Questions must have a position in the Survey!"
  }
};

app.post("/api/surveys", [checkSchema(surveySchema)], isLoggedIn, async (req, res) => {
  try {
    const error = validationResult(req);
    
    if(!error.isEmpty()){
      return res.status(400).json({ error: error.array() });
    }
    const result = await dbi.createSurvey(req.body);

    res.status(200).json({ message: "Survey successfully inserted in the database!" });
  } catch (err) {
    res.status(500).json({ error: "Database error while inserting the new survey" });
  }
});

app.post("/api/submissions", [checkSchema(surveySchema)], async (req, res) => {
  try {
    const error = validationResult(req.body);

    if(!error.isEmpty()){
      return res.status(400).json({ error: error.array() });
    } 

    const result = await dbi.submitSurvey(req.body);
    res.status(200).json({ message: "Survey submitted correctly!" });
  } catch(err) {
    res.status(500).json({ error: "Database error while submitting the survey" });
  }
});

app.get("/api/surveys/:id", async (req, res) => {
  try {
    const result = await dbi.getSurveyByID(req.params.id);

    if(result.error){
      res.status(404).json({ error: "Survey not found!" });
    } else {
      const survey = { ...result.survey, questions: [...result.openquest, ...result.closequest] };
      survey.questions.sort((q1,q2) => q1.order - q2.order);
      res.status(200).json(survey);
    }
  } catch(err) {
    res.status(500).json({ error: "Database error while retrieving the survey" });
  }
});

app.get("/api/surveys", async (req, res) => {
  try {
    const result = await dbi.getSurveysInfo();

    if(result.error){
      res.status(404).json({ error: "No surveys found!" });
    } else {
      res.status(200).json(result);
    }
  } catch(err) {
    res.status(500).json({ error: "Database error while retrieving the surveys" });
  }
});

app.get("/api/submissions/:id", async (req, res) => {
  try {
    const result = await dbi.getSubmissionsBySurveyID(req.params.id);
    if(result.error){
      res.status(404).json({ error: "No submissions found for that survey!" });
    } else {
      const subs = result.map(r => {
        return {
          id: r.id,
          user: r.user,
          answers: [...r.closequest, ...r.openquest]
        }
      });
      
      res.status(200).json(subs);
    }
  } catch(err) {
    res.status(500).json({ error: "Database error while retrieving the submissions" });
  }
});

app.post("/api/sessions", function (req, res, next) {
  passport.authenticate('local', (err, admin, info) => {
    if(err) {
      return next(err);
    }

    if(!admin){
      return res.status(401).json(info);
    }

    req.login(admin, (err) => {
      if(err){
        return next(err);
      }
      
      return res.json(req.user);
    });
  })(req, res, next);
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout();
  res.end();
});

app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()){
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: "Admin is not authenticated!" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

