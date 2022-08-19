import { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function NewQuestion({ show, close, createQuestion, handleShow }) {
    const [questionText, setQuestionText] = useState("");
    const [multipleChoice, setMultipleChoice] = useState(false);
    const [optional, setOptional] = useState(false);
    const [answers, setAnswers] = useState([{ id: 0, text: "" }]);
    const [minAnswers, setMinAnswers] = useState(0);
    const [maxAnswers, setMaxAnswers] = useState(0);

    const handleChangeAnswer = (newText, idx) => {
        let arrAns = [...answers];
        for(const a of arrAns){
            if(a.id === idx){
                a.text = newText;
            }
        }

        setAnswers([...arrAns]);
    };

    const handleNewAnswer = () => {
        if(answers.length === 10) return;

        const newAns = { id: answers.length, text: "" };
        setAnswers([...answers, newAns]);
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;

        event.preventDefault();

        if(form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }

        let question;
        if(multipleChoice){
            question = {
                text: questionText,
                min: minAnswers,
                max: maxAnswers,
                closed: 1,
                answers: answers.map(a => { return { text: a.text }; })
            };
        } else {
            question = {
                text: questionText,
                closed: 0,
                optional: optional ? 0 : 1
            }
        }

        createQuestion(question);
        resetForm();
    }

    const resetForm = () => {
        setQuestionText("");
        setOptional(false);
        setMultipleChoice(false);
        setMaxAnswers(0);
        setMinAnswers(0);
        setAnswers([{ id: 0, risposta: "" }]);
    }

    const renderAns = answers.map((a, key) => {
        return <Row key={key}> <Col xs={12}> <Form.Control className="formControl" value={a.text} required type="text" placeholder="Write the answer text" onChange={(event) => handleChangeAnswer(event.target.value, a.id)} /> </Col> </Row>
    });

    return (
        <Row className="justify-content-md-center">
            <Modal show={show} onHide={() => {close(); resetForm();}} size="lg" aria-labelledby="contained-modal-title-vcenter" centered className="modalStyle">
                <Modal.Header closeButton>
                    <Modal.Title className="formLabel"> Add a new question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formQuestion">
                            <Row className="justify-content-md-center">
                                <Col>
                                    <Form.Label className="formLabel"> Question Text </Form.Label>
                                    <Form.Control className="formControl" required type="text" value={questionText} placeholder="Write the question text" onChange={(event) => setQuestionText(event.target.value)} />
                                    <Form.Control.Feedback className="formControlFeedback" type="invalid"> Please, insert the question text! </Form.Control.Feedback>
                                </Col>
                            </Row>
                            <br></br>
                            <Row className="justify-content-md-center">
                                <Col xs={6}>
                                    <Form.Check className="formSwitch" type="switch" id="multiple-choice-switch" label="Is this a multiple choice question?" inline={true} checked={multipleChoice} value={multipleChoice} onChange={(event) => setMultipleChoice(old => !old)} />
                                </Col>
                                <Col xs={6}>
                                    { !multipleChoice && (<Form.Check className="formSwitch" type="switch" id="switch-open-question-optional" label="Is this question mandatory?" inline={true} checked={optional} value={optional} onChange={(event) => setOptional(old => !old)} />) }
                                </Col>
                            </Row>
                            <br></br>
                            { multipleChoice && renderAns }
                            <br></br>
                            { multipleChoice && (<Row className="justify-content-center"> <Button onClick={handleNewAnswer} disabled={answers.length === 10} className="formSubmit"> + </Button> </Row>)}
                            <br></br>
                            { multipleChoice && (<Form.Row className="jusitify-content-md-center">
                                <Col xs={6}>
                                    <Form.Label className="formLabel"> Min answers (0 if question is optional): </Form.Label>
                                    <Form.Control className="formControlNum" type="number" min="0" max={maxAnswers} value={minAnswers} onChange={(event) => setMinAnswers(event.target.value)} placeholder="Min" />
                                </Col>
                                <Col xs={6}>
                                    <Form.Label className="formLabel"> Max answers: </Form.Label>
                                    <Form.Control className="formControlNum" type="number" min={minAnswers} max={answers.length} value={maxAnswers} onChange={(event) => setMaxAnswers(event.target.value)} placeholder="Max" />
                                </Col>
                            </Form.Row>)}
                        </Form.Group>
                        <Button type="submit" className="formSubmit" onClick={close}> Submit </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Row>
    );
}

export default NewQuestion;