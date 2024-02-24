"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import { CreateQuestionParams, GetQuestionsParams } from "./shared.types";

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // ? Creating a question.
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // ? Create the tags and get them if they already exist.
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } }, //* filtering the tags using the name.
        { $setOnInsert: { name: tag }, $push: { question: question._id } }, //* updating the tags question field with the question id.
        { upsert: true, new: true }, //* if the tag does'nt exist then it will create an new tag with the same values specified in the update.
      );
      tagDocuments.push(existingTag._id);
    }

    // ? Pushing the tags into the question.
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // TODO Create an interaction record for the user's ask question action

    // TODO Increment the author reputation with +5 for creating a question and answers an question.
    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();
    const questions = await Question.find({})
      .populate({ path: "author", model: User })
      .populate({ path: "tags", model: Tag })
      .sort({ createdAt: -1 });
    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
