import { Form, FormGroup, Pagination, Col } from 'react-bootstrap';
import { useState } from 'react';

function UserAnswer({ currSurvey, submissions }) {
    const [activePageItem, setActivePageItem] = useState(0);
    const [currSubs, setCurrSubs] = useState(submissions[0]);

    const getAnswerByQuestionID = (questID, closed) => {
        let arrAns = currSubs.answers.filter(a => (closed === a.closed && a.id === questID));
        if(arrAns[0] === [] || arrAns === undefined || arrAns === [] || arrAns === undefined) {
            return {};
        } 

        if(Array.isArray(arrAns)) {
            return arrAns.map(a => a.answer);
        } else {
            return arrAns[0].answer;
        }
    };

    return (
        <>
            <Col></Col>
                <Col xs={4} className="m-2">
                    <h3> This are the submissions for survey: {currSurvey.title} </h3>
                    <Pagination>
                        {
                            submissions.map((s, key) => {
                                return <Pagination.Item active={activePageItem === key} key={key} onClick={() => { setCurrSubs(s); setActivePageItem(key); }}> {key + 1} </Pagination.Item>
                            })
                        }
                    </Pagination>
                    <h3> User: { currSubs.user } </h3>
                    <Form>
                        {
                            currSurvey.questions.map((q, key) => {
                                if(q.closed === 1) {
                                    return( 
                                        <FormGroup key={key} controlId={`${q.id}-${q.text}`}>
                                            <Form.Label className="formLabel"> {q.text} </Form.Label>
                                            {
                                                q.answers.map((a,key) => {
                                                    return <Form.Check className="formCheckBox" key={key} disabled checked={getAnswerByQuestionID(q.id, q.closed).includes(a.id)} type="checkbox" name={`${q.id}-${q.text}`} id={`${a.id}-${a.text}`} label={a.text} />
                                                })
                                            }    
                                        </FormGroup> );
                                } else {
                                    return (
                                        <FormGroup key={key} controlId={`${q.id}-${q.text}`}>
                                            <Form.Label className="formLabel"> {q.text} </Form.Label>
                                            <Form.Control className="formControl" readOnly value={getAnswerByQuestionID(q.id, q.closed)}></Form.Control>
                                        </FormGroup>
                                    );
                                }
                            })
                        }
                    </Form>
                </Col>
            <Col></Col>
        </>
    );
} 

export default UserAnswer;