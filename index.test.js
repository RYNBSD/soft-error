import { describe, it } from "node:test";
import asset from "node:assert";
import { _try, _catch } from "./dist/index.js";

function fnSync() {
  return 1;
}

async function fnAsync() {
  return 1;
}

describe("_try", () => {
  it("sync (failed)", () => {
    const errorMessage = "_try sync error";
    const value = _try({
      //    ^?
      handler() {
        if (fnSync() === "2") return; // force sync version
        throw new Error(errorMessage);
      },
      onError(error) {
        asset.strictEqual(error.message, errorMessage);
      },
    });
    asset.strictEqual(value, null);
  });

  it("sync (success)", () => {
    const value = _try({
      //    ^?
      handler() {
        return fnSync();
      },
      onError(error) {
        throw new Error("Not to reach", { cause: error });
      },
    });
    asset.strictEqual(value, 1);
  });

  it("async (failed)", async () => {
    const errorMessage = "_try async error";
    const value = _try({
      //    ^?
      async handler() {
        throw new Error(errorMessage);
      },
      onError(error) {
        asset.strictEqual(error.message, errorMessage);
      },
    });
    await value.then((value) => asset.strictEqual(value, null));
  });

  it("async (success)", async () => {
    const value = _try({
      //    ^?
      async handler() {
        return fnAsync();
      },
      onError(error) {
        throw new Error("Not to reach", { cause: error });
      },
    });
    await value.then((value) => asset.strictEqual(value, 1));
  });
});

describe("_catch", () => {
  it("sync (failed)", () => {
    const errorMessage = "_catch sync error";
    const result = _catch(() => {
      //    ^?
      if (1 === "2") return; // force sync version
      throw new Error(errorMessage);
    });

    asset.strictEqual(result.value, null);
    asset.strictEqual(result.error.message, errorMessage);
    asset.strictEqual(result.ok, false);
  });

  it("sync (success)", () => {
    const result = _catch(() => {
      //    ^?
      return 1;
    });

    asset.strictEqual(result.value, 1);
    asset.strictEqual(result.error, null);
    asset.strictEqual(result.ok, true);
  });

  it("async (failed)", async () => {
    const errorMessage = "_catch async error";
    const result = _catch(async () => {
      //    ^?
      throw new Error(errorMessage);
    });

    await result.then((r) => {
      asset.strictEqual(r.value, null);
      asset.strictEqual(r.error.message, errorMessage);
      asset.strictEqual(r.ok, false);
    });
  });

  it("async (success)", async () => {
    const result = _catch(async () => {
      //    ^?
      return fnAsync();
    });

    await result.then((r) => {
      asset.strictEqual(r.value, 1);
      asset.strictEqual(r.error, null);
      asset.strictEqual(r.ok, true);
    });
  });
});
