import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useLocation } from 'react-router';
import UserAnswer from './utils/UserAnswer';

function ViewUserAnswers({ getSubmissionsBySurveyID, getSurveyByID, currSurvey, submissions, setMessage, setShowMessage, setSubmissions, setCurrSurvey }) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSubmissions = async (id) => {
            try {
              const result = await getSubmissionsBySurveyID(id);
        
              setSubmissions(result.submissions);
            } catch(err) {
              setMessage({ text: err.message, type: "danger", dismissible: true});
              setShowMessage(true);
            }
        };
        
        const getSurvey = async (id) => {
            try {
              const result = await getSurveyByID(id);
        
              setCurrSurvey(result.survey);
            } catch(err) {
              setMessage({ text: err.message, type: "danger", dismissible: true});
              setShowMessage(true);
            }
        };

        const id = location.pathname.split("/")[2];
        
        getSurvey(id);
        getSubmissions(id);

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 150);

        return () => clearTimeout(timeout);
    }, [location, setMessage, setShowMessage, setCurrSurvey, setSubmissions, getSubmissionsBySurveyID, getSurveyByID]);

    if(loading === false){
        if(currSurvey.numsubs !== 0) {
            return (
                <>
                    <UserAnswer currSurvey={currSurvey} submissions={submissions} />
                </>
            );
        } else {
           return(<Redirect to="/" />);
        }
       
    } else {
        return (<></>);
    }
}

export default ViewUserAnswers;