import { expect } from "chai";
import { CompletionCreateParams, singleCompletion } from "../src/utils/openai/openai";

describe("singleCompletion function", () => {
  it("should return assistant's response and be of type string", async () => {
    const params: CompletionCreateParams = {
      max_tokens: 50,
    };

    const response = await singleCompletion({
      userMessage: "Hello, OpenAI!",
      params,
    });

    console.log("Returned value:", response);

    expect(response).to.be.a("string");
  });
});
