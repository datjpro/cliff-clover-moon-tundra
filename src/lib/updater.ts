import type { AppUpdateInfo } from "./types";

export const CURRENT_APP_VERSION = "1.0.1";
export const GITHUB_REPO = "datjpro/cliff-clover-moon-tundra";

/**
 * Compare two semver version strings (e.g., "1.0.1" vs "1.0.0" or "v1.0.1" vs "v1.0.0").
 * Returns:
 *   1 if v1 > v2 (v1 is newer)
 *  -1 if v1 < v2 (v2 is newer)
 *   0 if equal
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || "").replace(/^v/i, "").trim();
  const clean2 = (v2 || "").replace(/^v/i, "").trim();

  const parts1 = clean1.split(".").map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split(".").map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length, 3);
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export type UpdateCheckResult = {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateInfo: AppUpdateInfo | null;
  isOffline?: boolean;
  error?: string;
};

/**
 * Check if client currently has active network connectivity.
 */
export function isOnline(): boolean {
  if (typeof navigator !== "undefined" && typeof navigator.onLine === "boolean") {
    return navigator.onLine;
  }
  return true;
}

/**
 * Check GitHub repository for newer releases / tags with offline guard & timeout.
 */
export async function checkForAppUpdates(
  currentVersion: string = CURRENT_APP_VERSION,
  timeoutMs: number = 6000,
): Promise<UpdateCheckResult> {
  // 1. Immediate offline detection via navigator.onLine
  if (!isOnline()) {
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      updateInfo: null,
      isOffline: true,
      error: "Không có kết nối Internet. Vui lòng kiểm tra lại mạng của bạn để cập nhật Lumen.",
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // 2. Try fetching latest release from GitHub API
    const releaseRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github.v3+json" },
      },
    );

    clearTimeout(timer);

    if (releaseRes.ok) {
      const data = await releaseRes.json();
      const rawTag = (data.tag_name || data.name || "").trim();
      const remoteVer = rawTag.replace(/^v/i, "");

      if (remoteVer && compareSemver(remoteVer, currentVersion) > 0) {
        const downloadUrl =
          data.html_url ||
          `https://github.com/${GITHUB_REPO}/releases/tag/${rawTag}`;
        return {
          hasUpdate: true,
          currentVersion,
          latestVersion: remoteVer,
          updateInfo: {
            version: remoteVer,
            name: data.name || `Lumen v${remoteVer}`,
            body: data.body || "",
            htmlUrl: data.html_url,
            publishedAt: data.published_at,
            downloadUrl,
          },
        };
      } else {
        return {
          hasUpdate: false,
          currentVersion,
          latestVersion: remoteVer || currentVersion,
          updateInfo: null,
        };
      }
    }

    // 3. Fallback: query tags API if release is not published yet
    const tagsRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/tags?per_page=5`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
      },
    );

    if (tagsRes.ok) {
      const tags = await tagsRes.json();
      if (Array.isArray(tags) && tags.length > 0) {
        // Find highest version tag
        let highestTag = currentVersion;
        for (const t of tags) {
          const tagVer = (t.name || "").replace(/^v/i, "");
          if (compareSemver(tagVer, highestTag) > 0) {
            highestTag = tagVer;
          }
        }

        if (compareSemver(highestTag, currentVersion) > 0) {
          return {
            hasUpdate: true,
            currentVersion,
            latestVersion: highestTag,
            updateInfo: {
              version: highestTag,
              name: `Lumen v${highestTag}`,
              body: `Phiên bản mới v${highestTag} đã sẵn sàng trên GitHub.`,
              downloadUrl: `https://github.com/${GITHUB_REPO}/releases/tag/v${highestTag}`,
            },
          };
        }
      }
    }

    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      updateInfo: null,
    };
  } catch (err: any) {
    clearTimeout(timer);
    const isOfflineError =
      !isOnline() ||
      err?.name === "AbortError" ||
      /network|offline|failed to fetch|enotfound|econnrefused/i.test(err?.message || "");

    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      updateInfo: null,
      isOffline: isOfflineError,
      error: isOfflineError
        ? "Không có kết nối Internet hoặc mạng chập chờn. Vui lòng kiểm tra lại kết nối mạng của bạn."
        : err?.message || "Không thể kết nối đến máy chủ cập nhật",
    };
  }
}
