import { useState } from 'react';
import { Row, Col, Button, Form, ListGroup } from 'react-bootstrap';
import 'font-awesome/css/font-awesome.min.css';
import NewQuestion from './utils/NewQuestion.js';

function NewSurvey(props) {
    const [questions, setQuestions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [surveyTitle, setSurveyTitle] = useState("");

    const handleNewQuestion = (q) => {
        setQuestions([...questions, { id: questions.length, order: questions.length, ...q }]);
    }

    const handleDeleteQuestion = (q) => {
        setQuestions(questions => questions.filter(quest => quest.id !== q.id));
    }

    const handleMoveQuestionUp = (q) => {
        const newPos = q.order - 1;
        if(newPos < 0) return;
        
        let arrQuest = questions;

        arrQuest.forEach(quest => {
            if(q.id === quest.id) {
                quest.order = newPos;
            } else if(newPos <= quest.order && quest.id !== q.id) {
                quest.order += 1;
            }
        });

        arrQuest.sort((q1,q2) => q1.order - q2.order);
        setQuestions([...arrQuest]);
    }

    const handleMoveQuestionDown = (q) => {
        const newPos = q.order + 1;
        if(newPos > questions.length - 1) return;

        let arrQuest = questions;

        arrQuest.forEach(quest => {
            if(q.id === quest.id) {
                quest.order = newPos;
            } else if(newPos >= quest.order && quest.id !== q.id) {
                quest.order -= 1;
            }
        });

        arrQuest.sort((q1,q2) => q1.order - q2.order);
        setQuestions([...arrQuest]);
    }

    const resetForm = () => {
        setQuestions([]);
        setSurveyTitle("");
    }

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const renderQuestions = questions.map((q, key) => {
        return (
            <ListGroup.Item key={key}> 
                <Row>
                    <Col xs={9}>    
                        {q.text}
                    </Col>
                    <Col xs={1}>
                        <i className="fa fa-trash-o cursor-pointer" onClick={() => handleDeleteQuestion(q)} /> 
                    </Col> 
                    <Col xs={1}>
                        <i className="fa fa-arrow-circle-up cursor-pointer" onClick={() => handleMoveQuestionUp(q)} />
                    </Col>
                    <Col xs={1}>
                        <i className="fa fa-arrow-circle-down cursor-pointer" onClick={() => handleMoveQuestionDown(q)} />
                    </Col>
                </Row>
            </ListGroup.Item> ) 
    });

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();

        if(form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        const openquest = questions.filter(q => q.closed === 0).map(q => { return { text: q.text, optional: q.optional, order: q.order }; });
        const closequest = questions.filter(q => q.closed === 1).map(q => { return { text: q.text, min: q.min, max: q.max, order: q.order, answers: [...q.answers] }; });
        const survey = {
            admin: props.admin.id,
            title: surveyTitle,
            openquest: openquest,
            closequest: closequest
        };

        props.createSurvey(survey);
        resetForm();
    }

    return (
        <Row className="jutify-content-center">
            <Col></Col>
            <Col xs={4} className="m-2">
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNewSurvey">
                        <Form.Label className="formLabel"> Survey Title </Form.Label>
                        <Form.Control className="formControl" type="text" required placeholder="Title" value={surveyTitle} onChange={(event) => setSurveyTitle(event.target.value)} />
                        <Form.Control.Feedback className="formControlFeedback" type="invalid"> Please, insert a valid survey title! </Form.Control.Feedback> 
                    </Form.Group>

                    <ListGroup>
                        { renderQuestions }
                    </ListGroup>

                    <br></br>
                    <Row className="justify-content-center">
                        <Col xs={5} className="text-center">
                            <Button disabled={questions.length === 0} type="submit" variant="outline-light"> Submit survey </Button>
                        </Col>
                        <Col xs={6} className="text-center">
                            <Button onClick={handleShow} variant="outline-light"> Add new question </Button>
                        </Col>
                    </Row>
                </Form>
                <NewQuestion show={showModal} close={handleClose} createQuestion={handleNewQuestion}/>
            </Col>
            <Col></Col>
        </Row>
    );
}

export default NewSurvey;