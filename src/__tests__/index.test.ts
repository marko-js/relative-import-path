import { sep } from "path";
import snap from "mocha-snap";
import { relativeImportPath } from "..";

it("root paths", async () => {
  await snap.inline(relativeImportPathWithCurSep("/a/b", "/c/d"), `/c/d`);
  await snap.inline(relativeImportPathWithCurSep("a/b", "c/d"), `c/d`);
});

it("same directory", async () => {
  await snap.inline(relativeImportPathWithCurSep("/a/a", "/a/b"), `./b`);
  await snap.inline(relativeImportPathWithCurSep("a/a", "a/b"), `./b`);
});

it("up one directory", async () => {
  await snap.inline(relativeImportPathWithCurSep("/a/a/a", "/a/b/a"), `../b/a`);
});

it("separate node_modules", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/node_modules/a/a", "/a/node_modules/b/a"),
    `b/a`
  );
});

it("same node_module", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/node_modules/a/a", "/a/node_modules/a/b"),
    `./b`
  );
});

it("node_module child", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/node_modules/b"),
    `b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/b"),
    `b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/b/c", "/a/node_modules/b"),
    `b`
  );
});

it("node_module not visible", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/b/node_modules/b"),
    `/b/node_modules/b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/b/c", "/b/node_modules/b"),
    `/b/node_modules/b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/b/node_modules/b"),
    `./b/node_modules/b`
  );
});

it("separate scoped node_modules", async () => {
  await snap.inline(
    relativeImportPathWithCurSep(
      "/a/node_modules/@a/a/a",
      "/a/node_modules/@a/b/a"
    ),
    `@a/b/a`
  );
});

it("same scoped node_module", async () => {
  await snap.inline(
    relativeImportPathWithCurSep(
      "/a/node_modules/@a/a/a",
      "/a/node_modules/@a/a/b"
    ),
    `./b`
  );
});

function relativeImportPathWithCurSep(from: string, to: string) {
  if (sep === "\\") {
    return relativeImportPath(from.replace(/\//g, sep), to.replace(/\//g, sep));
  }

  return relativeImportPath(from, to);
}
