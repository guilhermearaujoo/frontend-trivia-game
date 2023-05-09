import PropTypes from 'prop-types';
import React, { Component } from 'react';
import he from 'he';
import { connect } from 'react-redux';
import { StopwatchFill } from 'react-bootstrap-icons';
import { changeIndexOfQuestions, increaseScore } from '../redux/actions';
import { calcDifficultyIndex } from '../services/calcDifficultyIndex';
import { randomAnswers } from '../services/randomAnswers';

class Question extends Component {
  state = {
    isAnswered: false,
    arrayAnswers: [],
    seconds: 30,
  };

  componentDidMount() {
    const { questionData } = this.props;
    const { correctAnswer, incorrectAnswers } = questionData;
    this.setState({
      arrayAnswers: randomAnswers(correctAnswer, incorrectAnswers),
    });
    this.decreaseTimer();
  }

  componentDidUpdate(prevProps) {
    const { questionData } = this.props;
    const { correctAnswer, incorrectAnswers } = questionData;
    if (questionData !== prevProps.questionData) {
      this.setState({
        arrayAnswers: randomAnswers(correctAnswer, incorrectAnswers),
      });
    }
  }

  handleAnswer = ({ target: { name: answer } }) => {
    const {
      dispatch,
      questionData: { correctAnswer, difficulty },
    } = this.props;
    const { seconds } = this.state;
    const difficultyIndex = calcDifficultyIndex(difficulty);
    clearInterval(this.timer);
    this.setState({ isAnswered: true });
    if (answer === correctAnswer) {
      dispatch(increaseScore(difficultyIndex, seconds));
    }
  };

  handleNextQuestion = () => {
    const { dispatch } = this.props;
    dispatch(changeIndexOfQuestions());
    this.setState({
      isAnswered: false,
      seconds: 30,
    });
    this.decreaseTimer();
  };

  decreaseTimer = () => {
    const oneSecond = 1000;
    this.timer = setInterval(() => {
      const { seconds } = this.state;
      this.setState(
        (prevState) => ({
          seconds: prevState.seconds - 1,
        }),
        () => {
          if (seconds === 1) {
            clearInterval(this.timer);
            this.setState({ isAnswered: true });
          }
        },
      );
    }, oneSecond);
  };

  handleOptionStyle = (selectedAnswer, correctAnswer) => {
    const buttonClass = 'btn btn-light';
    if (selectedAnswer === correctAnswer) return `${buttonClass} correct`;
    return `${buttonClass} wrong`;
  };

  render() {
    const { isAnswered, seconds, arrayAnswers } = this.state;
    const { questionData } = this.props;
    const { category, question, correctAnswer } = questionData;
    const decodedCategory = he.decode(category);
    const decodedQuestion = he.decode(question);
    const decodedAnswers = arrayAnswers.map((answer) => he.decode(answer));
    const nextButton = (
      <button
        type="button"
        onClick={ this.handleNextQuestion }
        data-testid="btn-next"
        className="btn btn-success col-6 offset-3"
      >
        Next question
      </button>
    );
    return (
      <div className="row justify-content-center align-items-center question m-2">
        <div className="col-12 col-md-6 col-md-6 card p-2">
          <h2
            data-testid="question-category"
            className="btn btn-warning col-9 question-category p-2"
          >
            {decodedCategory}
          </h2>
          <h4 data-testid="question-text" className="mt-5 p-4">{decodedQuestion}</h4>
          <p className="d-flex align-items-center justify-content-center gap-1">
            <StopwatchFill />
            Tempo:
            <span>{seconds}</span>
          </p>
        </div>
        <div data-testid="answer-options" className="col-12 col-md-4 buttons mt-3">
          {decodedAnswers.map((answer, index) => (
            <div key={ answer } className="row m-2">
              <button
                type="button"
                data-testid={
                  answer !== correctAnswer
                    ? `wrong-answer-${index}`
                    : 'correct-answer'
                }
                name={ answer }
                className={
                  isAnswered
                    ? this.handleOptionStyle(answer, correctAnswer)
                    : 'btn btn-light'
                }
                onClick={ this.handleAnswer }
                disabled={ isAnswered }
              >
                {answer}
              </button>
            </div>
          ))}
          {isAnswered ? nextButton : null}
        </div>
      </div>
    );
  }
}

Question.propTypes = {
  dispatch: PropTypes.func.isRequired,
  questionData: PropTypes.shape({
    category: PropTypes.string,
    type: PropTypes.string,
    difficulty: PropTypes.string,
    question: PropTypes.string,
    correctAnswer: PropTypes.string,
    incorrectAnswers: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default connect()(Question);
