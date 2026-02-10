import React from 'react'
import { render, screen } from '@testing-library/react'
import { Highlight } from '../Highlight'
import '@testing-library/jest-dom'

describe('Highlight Component', () => {
    it('renders plain text when no keywords are matched', () => {
        render(<Highlight text="Hello world" keywords="React" />)
        expect(screen.getByText('Hello world')).toBeInTheDocument()
        expect(screen.queryByRole('mark')).not.toBeInTheDocument()
    })

    it('highlights matched keywords in plain text', () => {
        render(<Highlight text="I love React and Next.js" keywords="React, Next.js" />)
        const marks = screen.getAllByRole('mark')
        expect(marks).toHaveLength(2)
        expect(marks[0]).toHaveTextContent('React')
        expect(marks[1]).toHaveTextContent('Next.js')
    })

    it('handles HTML content safely when isHTML is true', () => {
        const htmlText = 'I love <b>React</b> and <i>Next.js</i>'
        const { container } = render(
            <Highlight text={htmlText} keywords="React, Next.js" isHTML={true} />
        )

        // Check for HTML structure
        expect(container.querySelector('b')).toHaveTextContent('React')
        expect(container.querySelector('i')).toHaveTextContent('Next.js')

        // Check for highlights within tags
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(2)
        expect(marks[0]).toHaveTextContent('React')
        expect(marks[1]).toHaveTextContent('Next.js')
    })

    it('does not highlight keywords inside HTML tags', () => {
        const htmlText = '<div title="React">Content</div>'
        const { container } = render(
            <Highlight text={htmlText} keywords="React" isHTML={true} />
        )

        // The "React" inside the title attribute should not be highlighted
        // Only text nodes should be processed
        expect(container.querySelectorAll('mark')).toHaveLength(0)
        expect(container.querySelector('div')).toHaveAttribute('title', 'React')
    })

    it('passes through additional props to the wrapper span', () => {
        render(
            <Highlight
                text="Editable text"
                keywords="text"
                contentEditable={true}
                id="test-highlight"
                data-testid="highlight-span"
            />
        )

        const span = screen.getByTestId('highlight-span')
        expect(span).toHaveAttribute('contentEditable', 'true')
        expect(span).toHaveAttribute('id', 'test-highlight')
    })
})
