import { Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function TableRow(props) {
    return (
        <Col xs={3}>
            <Card className="card">
                <Card.Body className="cardBody">
                    <Card.Title className="cardTitle"> {props.survey.title} </Card.Title>
                    <Card.Text></Card.Text>
                    {props.showans && props.survey.numsub !== 0 ? <Link to={`/showanswers/${props.survey.id}`}> View submissions </Link> : (props.showans ? <Link to="/"> No submissions yet </Link> : <Link to={`/surveys/${props.survey.id}`}> Submit </Link>)}
                </Card.Body>
                <Card.Footer className="cardFooter"> Submissions: {props.survey.numsub} </Card.Footer>
            </Card>
        </Col>
        );
}

function SurveysTable({ surveys, isLoggedIn, admin }) {
    return (
        <Row className="m-5">
            {
                surveys.map((s, key) => {
                    if(isLoggedIn && admin.id === s.admin) {
                        return <TableRow key={key} survey={s} showans={true} />
                    } else if(!isLoggedIn) {
                        return <TableRow key={key} survey={s} showans={false} />
                    } else {
                        return <h1 key={key}> </h1>;
                    }
                }) 
            }
        </Row>
    );
}

export default SurveysTable;