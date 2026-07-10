"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
function formatMusicItem(item) {
    var _a, _b, _c, _d, _e, _f, _g;
    return {
        id: item.videoId,
        title: (_b = (_a = item.title.runs) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.text,
        artist: (_d = (_c = item.ownerText.runs) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text,
        artwork: (_g = (_f = (_e = item === null || item === void 0 ? void 0 : item.thumbnail) === null || _e === void 0 ? void 0 : _e.thumbnails) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.url,
    };
}
let lastQuery;
let musicContinToken;
async function searchMusic(query, page) {
    if (query !== lastQuery || page === 1) {
        musicContinToken = undefined;
    }
    lastQuery = query;
    let data = JSON.stringify({
        context: {
            client: {
                hl: "zh-CN",
                gl: "US",
                deviceMake: "",
                deviceModel: "",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0,gzip(gfe)",
                clientName: "WEB",
                clientVersion: "2.20231121.08.00",
                osName: "Windows",
                osVersion: "10.0",
                platform: "DESKTOP",
                userInterfaceTheme: "USER_INTERFACE_THEME_LIGHT",
                browserName: "Edge Chromium",
                browserVersion: "119.0.0.0",
                acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                screenWidthPoints: 1358,
                screenHeightPoints: 1012,
                screenPixelDensity: 1,
                screenDensityFloat: 1.2395833730697632,
                utcOffsetMinutes: 480,
                memoryTotalKbytes: "8000000",
                mainAppWebInfo: {
                    pwaInstallabilityStatus: "PWA_INSTALLABILITY_STATUS_UNKNOWN",
                    webDisplayMode: "WEB_DISPLAY_MODE_BROWSER",
                    isWebNativeShareAvailable: true,
                },
                timeZone: "Asia/Shanghai",
            },
            user: {
                lockedSafetyMode: false,
            },
            request: {
                useSsl: true,
                internalExperimentFlags: [],
            },
        },
        query: musicContinToken ? undefined : query,
        continuation: musicContinToken || undefined,
    });
    var config = {
        method: "post",
        url: "https://www.youtube.com/youtubei/v1/search?prettyPrint=false",
        headers: {
            "Content-Type": "text/plain",
        },
        data: data,
    };
    const response = (await (0, axios_1.default)(config)).data;
    const contents = response.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;
    const isEndItem = contents.find((it) => {
        var _a, _b, _c;
        return ((_c = (_b = (_a = it.continuationItemRenderer) === null || _a === void 0 ? void 0 : _a.continuationEndpoint) === null || _b === void 0 ? void 0 : _b.continuationCommand) === null || _c === void 0 ? void 0 : _c.request) === "CONTINUATION_REQUEST_TYPE_SEARCH";
    });
    if (isEndItem) {
        musicContinToken =
            isEndItem.continuationItemRenderer.continuationEndpoint
                .continuationCommand.token;
    }
    const musicData = contents.find((it) => it.itemSectionRenderer)
        .itemSectionRenderer.contents;
    let resultMusicData = [];
    for (let i = 0; i < musicData.length; ++i) {
        if (musicData[i].videoRenderer) {
            resultMusicData.push(formatMusicItem(musicData[i].videoRenderer));
        }
    }
    return {
        isEnd: !isEndItem,
        data: resultMusicData,
    };
}
async function search(query, page, type) {
    if (type === "music") {
        return await searchMusic(query, page);
    }
}
let cacheMediaSource = {
    id: null,
    urls: {},
};
function getBitrate(format) {
    return Number(format.averageBitrate || format.bitrate || 0);
}
function getAudioFormats(formats) {
    const audioFormats = formats
        .filter((it) => it.url && /^audio\//.test(it.mimeType || ""))
        .sort((a, b) => getBitrate(a) - getBitrate(b));
    const mp4AudioFormats = audioFormats.filter((it) => { var _a; return (_a = it.mimeType) === null || _a === void 0 ? void 0 : _a.includes("audio/mp4"); });
    return mp4AudioFormats.length ? mp4AudioFormats : audioFormats;
}
function getPlayableFormats(formats) {
    return formats
        .filter((it) => it.url && it.audioQuality)
        .sort((a, b) => getBitrate(a) - getBitrate(b));
}
async function getMediaSource(musicItem, quality) {
    var _a, _b;
    if (musicItem.id === cacheMediaSource.id) {
        return {
            url: cacheMediaSource.urls[quality] ||
                cacheMediaSource.urls.standard ||
                cacheMediaSource.urls.high ||
                cacheMediaSource.urls.low ||
                cacheMediaSource.urls.super,
        };
    }
    cacheMediaSource = {
        id: null,
        urls: {},
    };
    const data = {
        context: {
            client: {
                screenWidthPoints: 689,
                screenHeightPoints: 963,
                screenPixelDensity: 1,
                utcOffsetMinutes: 120,
                hl: "en",
                gl: "US",
                deviceMake: "Oculus",
                deviceModel: "Quest 3",
                androidSdkVersion: 32,
                userAgent: "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
                clientName: "ANDROID_VR",
                clientVersion: "1.65.10",
                osName: "Android",
                osVersion: "12L",
                originalUrl: "https://www.youtube.com/",
                theme: "CLASSIC",
                platform: "MOBILE",
                clientFormFactor: "UNKNOWN_FORM_FACTOR",
                webpSupport: false,
                timeZone: "Europe/Amsterdam",
                acceptHeader: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            },
            user: { enableSafetyMode: false },
            request: {
                internalExperimentFlags: [],
                consistencyTokenJars: [],
            },
        },
        contentCheckOk: true,
        racyCheckOk: true,
        videoId: musicItem.id,
    };
    var config = {
        method: "post",
        url: "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
        },
        data: JSON.stringify(data),
    };
    const result = (await (0, axios_1.default)(config)).data;
    const formats = (_a = result.streamingData) === null || _a === void 0 ? void 0 : _a.formats;
    const adaptiveFormats = (_b = result.streamingData) === null || _b === void 0 ? void 0 : _b.adaptiveFormats;
    const playableFormats = [...(formats !== null && formats !== void 0 ? formats : []), ...(adaptiveFormats !== null && adaptiveFormats !== void 0 ? adaptiveFormats : [])];
    const audioFormats = getAudioFormats(playableFormats);
    const fallbackFormats = getPlayableFormats(playableFormats);
    const sourceFormats = audioFormats.length ? audioFormats : fallbackFormats;
    const lowQualityFormat = sourceFormats[0];
    const highQualityFormat = sourceFormats[sourceFormats.length - 1];
    const standardQualityFormat = sourceFormats[Math.floor((sourceFormats.length - 1) / 2)];
    cacheMediaSource = {
        id: musicItem.id,
        urls: {
            low: lowQualityFormat === null || lowQualityFormat === void 0 ? void 0 : lowQualityFormat.url,
            standard: (standardQualityFormat === null || standardQualityFormat === void 0 ? void 0 : standardQualityFormat.url) || (lowQualityFormat === null || lowQualityFormat === void 0 ? void 0 : lowQualityFormat.url),
            high: (highQualityFormat === null || highQualityFormat === void 0 ? void 0 : highQualityFormat.url) || (standardQualityFormat === null || standardQualityFormat === void 0 ? void 0 : standardQualityFormat.url),
            super: (highQualityFormat === null || highQualityFormat === void 0 ? void 0 : highQualityFormat.url) || (standardQualityFormat === null || standardQualityFormat === void 0 ? void 0 : standardQualityFormat.url),
        },
    };
    return {
        url: cacheMediaSource.urls[quality] ||
            cacheMediaSource.urls.standard ||
            cacheMediaSource.urls.high ||
            cacheMediaSource.urls.low ||
            cacheMediaSource.urls.super,
    };
}
module.exports = {
    platform: "Youtube",
    author: '猫头猫',
    version: "0.0.1",
    supportedSearchType: ["music"],
    srcUrl: "https://gitee.com/maotoumao/MusicFreePlugins/raw/v0.1/dist/youtube/index.js",
    cacheControl: "no-cache",
    search,
    getMediaSource,
};
