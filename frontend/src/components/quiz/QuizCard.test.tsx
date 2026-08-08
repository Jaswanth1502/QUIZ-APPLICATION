import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizCard from './QuizCard';

describe('QuizCard', () => {
  it('renders the information required to choose a quiz', () => {
    render(<MemoryRouter><QuizCard quiz={{
      id:7, title:'Java Foundations', description:'Core Java practice',
      categoryId:1, category:'Java', difficulty:'EASY', durationMinutes:10,
      passingPercentage:60, status:'PUBLISHED', questionCount:5
    }}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'Java Foundations'})).toBeInTheDocument();
    expect(screen.getByText('Java')).toBeInTheDocument();
    expect(screen.getByText('EASY')).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'View details'})).toHaveAttribute('href','/quizzes/7');
  });
});
