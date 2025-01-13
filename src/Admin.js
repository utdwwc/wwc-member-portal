import React, { useEffect } from 'react';

function Admin() {
    useEffect(() => {
        document.title = 'Admin Page'; // Set the page title dynamically
    }, []);

    return (
        <div>
            <h1>Hi, Welcome!</h1>
        </div>
    );
}

export default Admin;
