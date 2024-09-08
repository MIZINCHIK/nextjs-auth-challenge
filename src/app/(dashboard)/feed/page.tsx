import React from "react";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

const page = async () => {
    const session = await getServerSession(authOptions)

    if (session?.user) {
        return <div>TODO posts of {session?.user.username} here</div>
    }

    return (
        <h2>Log in to see the feed</h2>
    )
};

export default page;