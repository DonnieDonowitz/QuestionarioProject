import { Form, FormGroup } from "react-bootstrap";

function MultipleChoiceQuestion({ question, fillQuestion, errors, updateErrors }) {
    const handleChange = (event) => {
        const filled = {
            id: question.id,
            text: question.text,
            min: question.min,
            max: question.max,
            closed: 1,
            answers: [{
                id: event.target.id.split("-")[0],
                text: event.target.id.split("-")[1]
            }]
        };
        
        if(question.text in errors) {
            const { [question.text]: err, ...ecc } = errors;
            updateErrors(ecc);
        }

        fillQuestion(filled);
    }

    const renderAns = question.answers.map((a,key) => {
        return <Form.Check className="formCheckBox" key={key} type="checkbox" name={`${question.id}-${question.text}`} id={`${a.id}-${a.text}`} label={a.text} onChange={handleChange} />
    });

    return (
        <FormGroup controlId={`${question.id}-${question.text}`}>
            <Form.Label className="formLabel"> {question.text} (Minimum answers: {question.min}, Maximum answers: {question.max})</Form.Label>
            { renderAns }
            <p className="errMCQ"> {question.text in errors ? errors[question.text] : ""} </p>
        </FormGroup>
    );
}

export default MultipleChoiceQuestion;