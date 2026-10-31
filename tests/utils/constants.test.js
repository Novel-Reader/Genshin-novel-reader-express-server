import { CUSTOM_TAGS } from "../../src/utils/constants";

describe("CUSTOM_TAGS", () => {
  it("uses the default signing key when JWT_SECRET is not configured", () => {
    const jwtSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    try {
      jest.isolateModules(() => {
        const { SIGN_KEY } = require("../../src/utils/constants");
        expect(SIGN_KEY).toBe("sign_key_novel_reader_xhykjyxgs");
      });
    } finally {
      if (jwtSecret === undefined) {
        delete process.env.JWT_SECRET;
      } else {
        process.env.JWT_SECRET = jwtSecret;
      }
    }
  });

  it("should contain Genshin role names", () => {
    const genshinRoles = [
      "绫华",
      "凯亚",
      "琴",
      "丽莎",
      "迪卢克",
      "芭芭拉",
      "莫娜",
      "迪奥娜",
      "优菈",
      "米卡",
    ];
    genshinRoles.forEach((role) => {
      expect(CUSTOM_TAGS).toContain(role);
    });
  });

  it("should contain StarRail role names", () => {
    const starRailRoles = ["三月七", "克拉拉"];
    starRailRoles.forEach((role) => {
      expect(CUSTOM_TAGS).toContain(role);
    });
  });

  it("length should be 37", () => {
    expect(CUSTOM_TAGS.length).toBe(37);
  });
});
