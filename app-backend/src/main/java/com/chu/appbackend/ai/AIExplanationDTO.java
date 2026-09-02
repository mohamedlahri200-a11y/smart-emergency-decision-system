package com.chu.appbackend.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AIExplanationDTO(
        String method,
        String summary,
        @JsonProperty("top_features") List<FeatureContributionDTO> topFeatures
) {}