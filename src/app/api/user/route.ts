import {NextResponse} from "next/server";
import db from "@/lib/db";
import {hash} from "bcrypt";
import {object, string} from "zod";

const UserSchema = object({
        name: string().min(1, 'Username is required').max(100),
        email: string().min(1, 'Email is required').email('Invalid email'),
        password: string()
            .min(1, 'Password is required')
            .min(8, 'Password must have than 8 characters')
    });

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, name, password } = UserSchema.parse(body)

        if (await db.user.findUnique({
            where: {
                email: email
            }
        })) {
            return NextResponse.json(
                {message: "Email has been used already"},
                {status: 409}
            );
        }

        if (await db.user.findUnique({
            where: {
                name: name
            }
        })) {
            return NextResponse.json(
                {message: "Username has been used already"},
                {status: 409}
            );
        }

        const {password: ignored, ...rest} = await db.user.create({
            data: {
                name,
                email,
                password: await hash(password, 10)
            }
        })

        return NextResponse.json({user: rest, message: "User registered successfully"},
            {status: 201});
    } catch (error) {
        return NextResponse.json({message: "Oops..."}, {status: 500});
    }
}