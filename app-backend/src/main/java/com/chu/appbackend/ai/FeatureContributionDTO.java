package com.chu.appbackend.ai;

public record FeatureContributionDTO(
        String feature,
        String value,
        Double impact,
        String direction
) {}