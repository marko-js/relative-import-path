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

it("virtual store node_modules", async () => {
  // `.pnpm` is not a module, so the shortened path would not be require'able.
  await snap.inline(
    relativeImportPathWithCurSep(
      "/a/a",
      "/a/node_modules/.pnpm/b@1.0.0/node_modules/b/a"
    ),
    `./node_modules/.pnpm/b@1.0.0/node_modules/b/a`
  );
  await snap.inline(
    relativeImportPathWithCurSep(
      "/a/b/c",
      "/a/node_modules/.pnpm/@a+b@1.0.0/node_modules/@a/b/a"
    ),
    `../node_modules/.pnpm/@a+b@1.0.0/node_modules/@a/b/a`
  );
});

it("node_modules directory that cannot be a package", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/.bin/b"),
    `./node_modules/.bin/b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/_cache/b"),
    `./node_modules/_cache/b`
  );
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/-tmp/b"),
    `./node_modules/-tmp/b`
  );
});

it("legacy capitalized node_module", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/JSONStream/b"),
    `JSONStream/b`
  );
});

it("nested node_modules", async () => {
  await snap.inline(
    relativeImportPathWithCurSep("/a/a", "/a/node_modules/b/node_modules/c/a"),
    `b/node_modules/c/a`
  );
});

function relativeImportPathWithCurSep(from: string, to: string) {
  if (sep === "\\") {
    return relativeImportPath(from.replace(/\//g, sep), to.replace(/\//g, sep));
  }

  return relativeImportPath(from, to);
}
