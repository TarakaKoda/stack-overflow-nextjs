"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";
import Tag from "@/database/tag.model";

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    connectToDatabase();
    const { userId } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // ? Find the interactions for the user and group by tags...
    // Todo Interaction in models so that we can get the tags and the other interaction very easily.

    return [
      { _id: "1", name: "Tag1" },
      { _id: "2", name: "Tag2" },
      { _id: "3", name: "Tag3" },
    ]; // * for now we can return these fake tags so that we can work on the tags badge in the user card.
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    connectToDatabase();
    const tags = await Tag.find({});
    if (!tags) {
      throw new Error("No tags found.");
    }
    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
}
