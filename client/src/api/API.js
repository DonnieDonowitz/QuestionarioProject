async function createSurvey(survey) {
    const url = "/api/surveys";

    let res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(survey)
    });

    try {
        if(res.ok) {
            const msg = await res.json();
            return { message: msg.message };
        } else {
            const err = await res.json();
            return { error: err.error };
        }
    } catch(err) {
        throw new Error("Error while connecting to the server");
    }
}

async function submitSurvey(survey) {
    const url = "/api/submissions";
   
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(survey)
        });

        if(res.ok) {
            const msg = await res.json();
            return { message: msg.message };
        } else {
            const err = await res.json();
            return { error: err.error };
        }
    } catch(err) {
        throw new Error("Error while connecting to the server");
    }
}

async function getSurveyByID(id) {
    const url = `/api/surveys/${id}`;

    try {
        let res = await fetch(url);
        
        if(res.ok) {
            const surv = await res.json();
            return { message: "Survey correctly retrieved from the server", survey: surv };
        } else {
            const err = await res.json();
            return { error: err.error, survey: { questions: [] } };
        }
    } catch(err) {
        throw new Error("Error while connecting to the server");
    }
}

async function getSurveysInfo() {
    const url = "/api/surveys";
    let res = await fetch(url);

    try {
        if(res.ok) {
            const survInfo = await res.json();
            return { message: "Surveys informations correctly retrieved from the server", surveys: survInfo };
        } else {
            const err = await res.json();
            return { error: err.error, surveys: [] };
        }
    } catch(err) {
        throw new Error("Error while connecting to the server");
    }
}

async function getSubmissionsBySurveyID(id) {
    const url = `/api/submissions/${id}`;
    let res = await fetch(url);
    
    try {
        if(res.ok) {
            const subs = await res.json();
            return { message: "Submissions correctly retrieved from the server", submissions: subs };
        } else {
            const err = await res.json();
            return { error: err.error, submissions: [] };
        }
    } catch(err) {
        throw new Error("Error while connecting to the server");
    }
}

async function logIn(credentials) {
    const url = "/api/sessions";

    let res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    if(res.ok){
        const admin = await res.json();
        return admin;
    } else {
        try {
            const err = await res.json();
            return { error: err.error };
        } catch(err) {
            throw new Error("Error while trying to login");
        }
    }
}

async function logOut() {
    const url = "/api/sessions/current";

    try {
        await fetch(url, { method: "DELETE" });
    } catch(err) {
        throw new Error("Error while trying to logout");
    }
}

async function getAdminInfo() {
    const url = "/api/sessions/current";    
    const res = await fetch(url);
    const adminInfo = await res.json();

    if(res.ok) {
        return adminInfo;
    } else {
        throw adminInfo;
    }
}

const API = { logIn, logOut, getAdminInfo, createSurvey, getSurveysInfo, getSurveyByID, submitSurvey, getSubmissionsBySurveyID };

export default API;