














import React from "react";

export interface Feature {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export interface Metier {
    id: number;
    title: string;
    description: string;
    image: string;
    icon: React.ReactNode;
    color: string;
    features: string[];
}

export interface Statistic {
    value: string;
    label: string;
    color: string;
}