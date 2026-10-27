import React, { useEffect, useState } from "react";

import axios from "axios";

function AxiosAsync() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dataFetch();
    }, []);

    const dataFetch = async () => {
        try {
            const response = await axios.get(
                "https://jsonplaceholder.typicode.com/posts",
            );
            console.log(response.data);
            setData(response.data);
        } catch (error) {
            console.log(error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <h1>Loading.....</h1>;
    }

    if (error) {
        return <h1>Error: {error.message}</h1>;
    }

    return (
        <>
            <h1>Async/await axios</h1>
            <ul>
                {data.map((a) => (
                    <li key={a.id}>
                        <h1>{a.title}</h1>
                        <p>{a.body}</p>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default AxiosAsync;