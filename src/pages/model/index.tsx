import React from "react";
import BaseLayout from "@/layout/BaseLayout";
import PageLayout from "@/layout/PageLayout/PageLayout";
import { ModelViewer } from "@/Components/pages/3DModel/3DModel";

export default function Index() {
  return (
    <>
      <BaseLayout>
        <PageLayout>
          <ModelViewer />
        </PageLayout>
      </BaseLayout>
    </>
  );
}
