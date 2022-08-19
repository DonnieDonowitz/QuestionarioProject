import { Form, FormGroup } from 'react-bootstrap';

function OpenQuestion({ question, fillQuestion, errors, updateErrors }) {
    const handleChange = (event) => {
        const filled = {
            id: question.id,
            text: question.text,
            closed: 0,
            optional: question.optional,
            answer: [event.target.value]
        };

        if(question.text in errors) {
            const { [question.text]: err, ...ecc } = errors;
            updateErrors(ecc);
        }

        fillQuestion(filled);
    };

    return (
        <FormGroup controlId={`${question.id}-${question.text}`}>
            <Form.Label className="formLabel"> {question.text} {question.optional ? "" : " (This question is mandatory)"} </Form.Label>
            <Form.Control className="formControl" onChange={handleChange} as="textarea" required={question.optional} isInvalid={question.text in errors}/>
            <Form.Control.Feedback className="formControlFeedback" type="invalid"> {errors[question.text]} </Form.Control.Feedback>
        </FormGroup>
    );
}

export default OpenQuestion;