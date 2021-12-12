const { sha256 } = require("../utils/crypto");

describe("hash()", () => {
  const hashedString = sha256("hello", "hi");
  it("can convert to sha256 hash", () => {
    expect(hashedString).toBe(
      "410e5242e95f786806b210a1cc997196709c22c5c6a1a00fd1e77c6ec203ff5d"
    );
  });
  it("won`t consider the position of arguments", () => {
    const hashedString2 = sha256("hi", "hello");
    expect(hashedString2).toBe(hashedString);
  });

  // describe()
});
