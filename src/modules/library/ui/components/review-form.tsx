"use client";

import { StarPicker } from "@/components/star-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ReviewGetOneOutput } from "@/modules/reviews/types";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ReviewFormProps {
  productId: string;
  initialData?: ReviewGetOneOutput;
}

const formSchema = z.object({
  rating: z.number().min(1, { message: "Rating is required" }).max(5),
  description: z.string().min(3, { message: "Description is required" }),
});

export const ReviewForm = ({ productId, initialData }: ReviewFormProps) => {
  const [isPreview, setIsPreview] = useState(!!initialData);

  const trpc = useTRPC();

  const queryClient = useQueryClient();

  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
        setIsPreview(false);
      },
    })
  );

  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({ productId })
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
        setIsPreview(false);
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: initialData?.rating || 0,
      description: initialData?.description || "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Header based on preview or editing state */}
        <p className="font-medium">
          {isPreview ? "Your rating:" : "Liked it? Give it a rating"}
        </p>

        {/* Rating input using StarPicker */}
        <FormField
          control={form.control}
          name={"rating"}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker {...field} disabled={isPreview} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description input using Textarea */}
        <FormField
          control={form.control}
          name={"description"}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Want to leave a written review?"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button shown only in edit mode */}
        {!isPreview && (
          <Button
            variant={"elevated"}
            disabled={createReview.isPending || updateReview.isPending}
            type="submit"
            size={"lg"}
            className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
          >
            {initialData ? "Update review" : "Post review"}
          </Button>
        )}

        {/* Edit button shown only in preview mode */}
        {isPreview && (
          <Button
            onClick={() => setIsPreview(false)}
            size={"lg"}
            type="button"
            variant={"elevated"}
            className="w-fit "
          >
            Edit
          </Button>
        )}
      </form>
    </Form>
  );
};

export const ReviewFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="font-medium">Liked it? Give it a rating</p>

      <StarPicker disabled />

      <Textarea placeholder="Want to leave a written review?" disabled />

      <Button
        variant={"elevated"}
        disabled
        type="button"
        size={"lg"}
        className="bg-black text-white hover:bg-pink-400 hover:text-primary w-fit"
      >
        Post review
      </Button>
    </div>
  );
};
