import OpinionCard from "./OpinionCard";
import UserCard from "./userCard";
import type { PanoramaResponse } from "../../types/panoramaResponse";
import { isOpinionResponse } from "../../utils/panoramaResponses";

type CardsPlaceProps = {
  responses: PanoramaResponse[];
};

function getResponseKey(item: PanoramaResponse, index: number) {
  return `${item.formId ?? "form"}-${item.id ?? index}-${index}`;
}

export default function CardsPlace({ responses }: CardsPlaceProps) {
  return (
    <>
      {responses.map((item, index) =>
        isOpinionResponse(item) ? (
          <OpinionCard key={getResponseKey(item, index)} opinions={[item]} />
        ) : (
          <UserCard key={getResponseKey(item, index)} responses={[item]} />
        ),
      )}
    </>
  );
}
