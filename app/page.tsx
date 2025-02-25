import Link from "next/link";
import React from "react";

const Home = () => {
    return (
        <div>
            Welcome Page <br />
            <Link href={"/developer"}>Go to dashboard</Link>
        </div>
    );
};

export default Home;
