import React from 'react';
import { useQuery } from 'react-apollo';
import { getBooks } from '@app/queries/books.graphql';

const BookList = () => {
    const { data, loading } = useQuery(getBooks);

    if (loading) {
        return <p>books are loading</p>;
    }

    const { books } = data;

    return books.map(({ id, title, writer }) => (
        <div key={id}>
            <h2>{title}</h2>
            <span>Written by {writer.email}</span>
        </div>
    ));
};

export default BookList;
