import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class AddAttachmentInput {
  @Field()
  articleVersionId: string;
  
  @Field()
  fileName: string;
  
  @Field()
  fileType: string;
  
  @Field(() => Int)
  fileSize: number;
  
  @Field()
  url: string;
}