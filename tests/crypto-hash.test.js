const { sha256 } = require("../utils/crypto");

describe("hash()", () => {
  const hashedString = sha256("hello", "hi");
  it("can convert to sha256 hash", () => {
    expect(hashedString).toBe(
      "fd0d94455d6dcd20c5e3b9f70c7cd0227ff99f55640824cd4230475fa72bf7f5"
    );
  });
  it("won`t consider the position of arguments", () => {
    const hashedString2 = sha256("hi", "hello");
    expect(hashedString2).toBe(hashedString);
  });

  // describe()
});
