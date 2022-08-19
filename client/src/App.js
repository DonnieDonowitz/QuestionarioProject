import { useEffect, useState } from 'react';
import { Container, Alert } from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import CustomNavbar from './components/CustomNavbar.js';
import LoginForm from './components/LoginForm.js';
import SurveysTable from './components/SurveysTable.js';
import NewSurvey from './components/NewSurvey.js';
import Survey from './components/Survey.js';
import ViewUserAnswers from './components/ViewUserAnswers.js';
import API from './api/API.js';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

function App() {
  const [admin, setAdmin] = useState('');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currSurvey, setCurrSurvey] = useState({ questions: [] });
  const [allSurveys, setAllSurveys] = useState([]);
  const [submissions, setSubmissions] = useState([{ answers: [] }]);
  const [update, setUpdate] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const admin = await API.getAdminInfo();
        setAdmin(admin);
        setLoggedIn(true);
      } catch(err) {}
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const getAllSurveys = async () => {
      try {
        const result = await API.getSurveysInfo();
        setAllSurveys(result.surveys);
      } catch(err) {}
    };
    if(update) {
      getAllSurveys();
      setUpdate(false);
    }
  }, [update]);

  const createSurvey = async (survey) => {
    try {
      const result = await API.createSurvey(survey);

      setMessage({ text: result.error ? result.error : result.message, type: result.error ? "danger" : "success", dismissible: true });
      setShowMessage(true);

      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 750);

      setUpdate(true);

      return () => clearTimeout(timeout);
    } catch(err) {
      setMessage({ text: err.message, type: "danger", dismissible: true });
      setShowMessage(true);
    }
  };

  const logIn = async (credentials) => {
    try {
      const admin = await API.logIn(credentials);
      setLoggedIn(true);
      setAdmin(admin);
      setUpdate(true);
      setMessage({ text: `Welcome back, ${admin.username}`, type: "success", dismissible: true });
      setShowMessage(true);

      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 850);

      return () => clearTimeout(timeout);
    } catch(err) {
      setMessage({ text: err.message, type: "danger", dismissible: true});
      setShowMessage(true);
    }
  };

  const logOut = async () => {
    try {
      await API.logOut();

      setLoggedIn(false);
      setAdmin('');
      setMessage({ text: `Goodbye`, type: "success", dismissible: true });
      setShowMessage(true);

      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 850);

      return () => clearTimeout(timeout);
    } catch(err) {
      setMessage({ text: err.message, type: "danger", dismissible: true});
      setShowMessage(true);
    }
  };

  const submitSurvey = async (survey) => {
    try { 
      const result = await API.submitSurvey(survey);

      setMessage({ text: result.error ? result.error : result.message, type: result.error ? "danger" : "success", dismissible: true });
      setUpdate(true);
      setShowMessage(true);

      const timeout = setTimeout(() => {
        setShowMessage(false);
      }, 850);

      return () => clearTimeout(timeout);
    } catch(err) {
      setMessage({ text: err.message, type: "danger", dismissible: true});
      setShowMessage(true);
    }
  };

  return (
    <Router>
      <Container id="mainContainer" fluid>
        <CustomNavbar admin={admin} loggedIn={loggedIn} logout={logOut} />

        { showMessage && <Alert variant={message.type} onClose={() => setMessage('')} dismissible={message.dismissible}> {message.text} </Alert> }        
        
        <Switch>

          <Route path="/login" render={() => 
            <>
            {loggedIn ? <Redirect to="/" /> : <> <LoginForm login={logIn} /> </>}
            </>
          } />

          <Route path="/newsurvey" render={() => 
            <>
              {loggedIn ? <> <NewSurvey createSurvey={createSurvey} admin={admin} /> </> : <Redirect to="/login" />}
            </>
          } />

          <Route path="/showanswers/:id" render={() => 
            <>
              {loggedIn ? <> <ViewUserAnswers getSubmissionsBySurveyID={API.getSubmissionsBySurveyID} getSurveyByID={API.getSurveyByID} currSurvey={currSurvey} submissions={submissions} setMessage={setMessage} setShowMessage={setShowMessage} setSubmissions={setSubmissions} setCurrSurvey={setCurrSurvey} /> </> : <Redirect to="/login" />}
            </>
          } />

          <Route exact path="/" render={() => 
            <SurveysTable isLoggedIn={loggedIn} surveys={allSurveys} admin={admin} />
          } />

          <Route path="/surveys/:id" render={() => 
              <>
              {!loggedIn ? <Survey getSurveyByID={API.getSurveyByID} currSurvey={currSurvey} fillSurvey={submitSurvey} setMessage={setMessage} setShowMessage={setShowMessage} setCurrSurvey={setCurrSurvey} /> : <Redirect to="/" />}
              </>
          }/>

        </Switch>
      </Container>
    </Router>
  );

}

export default App;
