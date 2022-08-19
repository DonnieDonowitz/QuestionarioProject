import { Form, Button, FormGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import OpenQuestion from './utils/OpenQuestion';
import MultipleChoiceQuestion from './utils/MultipleChoiceQuestion';

function Survey({ currSurvey, getSurveyByID, fillSurvey, setCurrSurvey, setShowMessage, setMessage}) {
    const location = useLocation();
    const history = useHistory();
    const [validationErrors, setValidationErrors] = useState({});
    const [filledQuestions, setFilledQuestions] = useState([]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const quest = currSurvey.questions.map(q => {
            if(q.closed === 1) {
                return {
                    id: q.id,
                    text: q.text,
                    closed: 1,
                    min: q.min,
                    max: q.max,
                    answers: []
                }
            } else {
                return {
                    id: q.id,
                    text: q.text,
                    closed: 0,
                    optional: q.optional,
                    answer: []
                }
            }
        });

        setFilledQuestions(quest);
    }, [currSurvey]);

    useEffect(() => {
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

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 350);

        return () => clearTimeout(timeout);
    }, [location, setShowMessage, setCurrSurvey, setMessage, getSurveyByID]);
    
    const handleFilledMultipleChoiceQuestions = (question) => {
        let arrQuest = filledQuestions;

        arrQuest.forEach(q => {
            if(q.id === question.id && q.closed === 1) {
                if(q.answers === undefined || q.answers.length === 0) {
                    q.answers = [...question.answers];
                } else if(q.answers.filter(a => a.id === question.answers[0].id).length !== 0) {
                    q.answers = q.answers.filter(a => a.id !== question.answers[0].id);
                } else {
                    q.answers.push(question.answers[0]);
                }
            }
        });

        setFilledQuestions(arrQuest);
    };

    const handleFilledOpenQuestions = (question) => {
        let arrQuest = filledQuestions;

        arrQuest.forEach(q => {
            if(q.id === question.id && q.closed === 0){
                q.answer = [...question.answer];
            }
        });

        setFilledQuestions(arrQuest);
    };

    const handleUpdateValidationErrors = (errors) => {
        setValidationErrors(errors);
    };

    const handleChangeUsername = (event) => {
        setUsername(event.target.value);

        if("username" in validationErrors) {
            const { username, ...ecc } = validationErrors;
            setValidationErrors(ecc);
        }
    };

    const validateSub = () => {
        const errors = {};
        const closedQuestions = filledQuestions.filter(q => q.closed === 1);
        const openQuestions = filledQuestions.filter(q => q.closed === 0);

        closedQuestions.forEach(mcq => {
            if(mcq.answers.length < mcq.min || mcq.answers.length > mcq.max) {
                errors[mcq.text] = `You must select at least ${mcq.min} answers and at most ${mcq.max} answers!`; 
            }
        });

        openQuestions.forEach(oq => {
            if(oq.optional === 0 && (oq.answer.length === 0 || oq.answer.length > 200 || oq.answer === [""] || oq.answer === [] || oq.answer[0] === "" || oq.answer === undefined)) {
                errors[oq.text] = "You must write something!";
            }
        });

        if(!username || username.trim() === '') {
            errors.username = "Please, provide a valid username!";
        }

        return errors;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const errors = validateSub();
        event.preventDefault();

        if(Object.entries(errors).length === 0) {
            const filledSurvey = {
                id: currSurvey.id,
                title: currSurvey.title,
                username: username,
                openquest: filledQuestions.filter(q => q.closed === 0),
                closequest: filledQuestions.filter(q => q.closed === 1)
            }
            
            fillSurvey(filledSurvey);
            history.push("/");
        } else {
            setValidationErrors(errors);
        }
    };
 
    const renderQuest = currSurvey.questions.map((q,key) => {
        if(q.closed === 1){
            return <MultipleChoiceQuestion key={key} fillQuestion={handleFilledMultipleChoiceQuestions} question={q} errors={validationErrors} updateErrors={setValidationErrors}></MultipleChoiceQuestion>;
        } else {
            return <OpenQuestion key={key} fillQuestion={handleFilledOpenQuestions} question={q} errors={validationErrors} updateErrors={handleUpdateValidationErrors}></OpenQuestion>;
        }
    });
    
    if(!loading){
        return (
            <>
                { currSurvey.questions.length !== 0 ? 
                    <Form noValidate onSubmit={handleSubmit}>
                        <center> <h1 style={{ fontWeight: 'bold', margin: '10px', color: '#17252A'}}> {currSurvey.title} </h1> </center>
                        <FormGroup controlId={`${currSurvey.id}-${username}`}> 
                            <Form.Label className="formLabel"> Insert your username </Form.Label>
                            <Form.Control className="formControl" type="text" required placeholder="Insert username here" value={username} onChange={handleChangeUsername} isInvalid={"username" in validationErrors} />
                            <Form.Control.Feedback type="invalid" className="formControlFeedback"> Please, insert a valid username! </Form.Control.Feedback>        
                        </FormGroup>
                        {renderQuest}
                        <Button type="submit" variant="outline-light"> Submit </Button>
                    </Form>
                : <h2> No data available </h2>}
            </>
        );
    } else {
        return <></>
    }
}

export default Survey;