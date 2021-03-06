import { sep } from "path";
const nms = sep + "node_modules" + sep;
const nmsLen = nms.length;
const backSep = `../`;
const toPosix =
  sep === "/"
    ? (v: string) => v
    : (v: string) => {
        let result = "";
        for (let i = v.length; i--; ) {
          const c = v[i];
          result = (c === sep ? "/" : c) + result;
        }

        return result;
      };

/**
 * Given two absolute file paths returns a relative importable path.
 * Applicable `node_modules` resolutions are automatically shortened.
 * All paths are converted to POSIX style.
 */
export function relativeImportPath(from: string, to: string): string {
  let i = 0;
  let sepPos = -1;
  let prevSepPos = -1;
  let prevPrevSepPos = -1;
  const fromLen = from.length;
  const commonLen = Math.min(to.length, fromLen);

  for (; i < commonLen; i++) {
    const curChar = to[i];
    if (curChar !== from[i]) break;
    if (curChar === sep) {
      prevPrevSepPos = prevSepPos;
      prevSepPos = sepPos;
      sepPos = i;
    }
  }

  if (sepPos !== -1) {
    // Check for `node_modules` immediately after the last common sep.
    if (hasNms(to, sepPos)) {
      return toPosix(stripNms(to, sepPos));
    }

    if (prevSepPos !== -1) {
      // Check the previous directory for an `@` which may indicate we found a scoped module.
      if (prevPrevSepPos !== -1 && to[prevSepPos + 1] === "@") {
        // Will check the parent directory of this potentially scoped module to see
        // if it is actually in node_modules.
        prevSepPos = prevPrevSepPos;
      }

      // Check if the common directory is `node_modules` itself.
      if (hasNms(to, prevSepPos)) {
        return toPosix(stripNms(to, prevSepPos));
      }
    }
  }

  if (sepPos <= 0) return toPosix(to);

  let back = 0;
  for (; i < fromLen; i++) if (from[i] === sep) back++;

  if (back) {
    return backSep.repeat(back) + toPosix(to.slice(sepPos + 1));
  } else {
    return `.${toPosix(to.slice(sepPos))}`;
  }
}

function hasNms(src: string, pos: number) {
  return src.slice(pos).startsWith(nms);
}

function stripNms(src: string, pos: number) {
  return src.slice(pos + nmsLen);
}
