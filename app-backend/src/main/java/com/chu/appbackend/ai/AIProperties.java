package com.chu.appbackend.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "ai.service")
public class AIProperties {
    private String url;
    private String basePath;
    private int connectTimeout = 3000;
    private int readTimeout = 10000;

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getBasePath() { return basePath; }
    public void setBasePath(String basePath) { this.basePath = basePath; }
    public int getConnectTimeout() { return connectTimeout; }
    public void setConnectTimeout(int connectTimeout) { this.connectTimeout = connectTimeout; }
    public int getReadTimeout() { return readTimeout; }
    public void setReadTimeout(int readTimeout) { this.readTimeout = readTimeout; }

    public String fullBaseUrl() {
        return url + basePath;
    }
}
