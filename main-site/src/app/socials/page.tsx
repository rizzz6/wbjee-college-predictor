import type { Metadata } from "next";
import SocialsClient from "./SocialsClient";

export const metadata: Metadata = {
    title: "Join the WBJEE Community | Discord & Reddit",
    description: "Connect with the largest community of WBJEE aspirants on Reddit and Discord. Get real-time help, share study resources, and find support from seniors.",
    alternates: {
        canonical: '/socials', // <--- THIS FIXES THE ERROR
    },
    openGraph: {
        title: "Join the r/wbjee Community",
        description: "Connect with WBJEE aspirants on Reddit and Discord.",
        url: "https://www.rwbjee.com/socials",
        type: "website",
        images: [
            {
                url: "/og-image.svg", // Ensure this image exists or change to a valid path
                width: 1200,
                height: 630,
                alt: "r/wbjee Community",
            },
        ],
    }
};

export default function SocialsPage() {
    return <SocialsClient />;
}