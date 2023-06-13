import * as React from 'react';
import { Html, Tailwind, Button, Text, Container, Heading, Body } from '@react-email/components';

export function Email(props: { url: string }) {
    const { url } = props;

    return (
        <Html lang="en">
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans text-center mt-40">
                    <Container className="border border-solid border-[#eaeaea] rounded-lg">
                        <Heading className="semibold">Reset your chit-chat password</Heading>
                        <Text>
                            We heard that you lost your chit-chat password. Sorry about that!
                        </Text>
                        <Text>
                            But don’t worry! You can use the following button to reset your
                            password:
                        </Text>
                        <Button
                            className="bg-[#021431] p-5 rounded-md border text-white shadow-sm font-semibold"
                            href={url}
                        >
                            Reset your password
                        </Button>
                        <Text>If you don’t use this link within 1 day, it will expire.</Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
