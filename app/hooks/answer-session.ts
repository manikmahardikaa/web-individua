import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnswerSessionDataModel } from "../model/answer-session";

const baseUrl = "/api/answer-session";
const queryKey = "answer-session";

export const useAnswerSessions = ({ userId }: { userId?: string }) => {
  const { data, isLoading: fetchLoading, refetch, isFetching } = useQuery({
    queryKey: [queryKey, userId],
    queryFn: async () => {
      const result = await axios.get(`${baseUrl}?userId=${userId}`);
      return result.data.result as AnswerSessionDataModel[];
    },
    enabled: Boolean(userId),
  });

  return {
    data,
    fetchLoading: fetchLoading || isFetching,
    refetch,
  };
};
