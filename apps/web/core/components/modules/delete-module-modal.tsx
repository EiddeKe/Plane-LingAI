/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// types
import {
  EUserPermissions,
  EUserPermissionsLevel,
  PROJECT_ERROR_MESSAGES,
} from "@plane/constants";
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import type { IModule } from "@plane/types";
// ui
import { AlertModalCore } from "@plane/ui";
// constants
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useUser, useUserPermissions } from "@/hooks/store/user";
import { useAppRouter } from "@/hooks/use-app-router";

type Props = {
  data: IModule;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteModuleModal = observer(function DeleteModuleModal(props: Props) {
  const { data, isOpen, onClose } = props;
  // states
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  // router
  const router = useAppRouter();
  const { workspaceSlug, projectId, moduleId, peekModule } = useParams();
  // store hooks
  const { deleteModule } = useModule();
  const { t } = useTranslation();
  // user & permissions
  const { data: currentUser } = useUser();
  const { allowPermissions } = useUserPermissions();

  const isModuleCreator = data?.created_by === currentUser?.id;
  const canPerformProjectAdminActions = allowPermissions(
    [EUserPermissions.ADMIN],
    EUserPermissionsLevel.PROJECT,
    workspaceSlug?.toString(),
    data.project_id
  );
  const authorized = isModuleCreator || canPerformProjectAdminActions;

  const handleClose = () => {
    onClose();
    setIsDeleteLoading(false);
  };

  const handleDeletion = async () => {
    if (!workspaceSlug || !projectId) return;

    if (!authorized) {
      setToast({
        title: t(PROJECT_ERROR_MESSAGES.permissionError.i18n_title),
        type: TOAST_TYPE.ERROR,
        message:
          PROJECT_ERROR_MESSAGES.permissionError.i18n_message &&
          t(PROJECT_ERROR_MESSAGES.permissionError.i18n_message),
      });
      handleClose();
      return;
    }

    setIsDeleteLoading(true);

    await deleteModule(workspaceSlug.toString(), projectId.toString(), data.id)
      .then(() => {
        if (moduleId || peekModule) router.push(`/${workspaceSlug}/projects/${data.project_id}/modules`);
        handleClose();
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Success!",
          message: "Module deleted successfully.",
        });
      })
      .catch((errors) => {
        const isPermissionError = errors?.error === "You don't have the required permissions.";
        const currentError = isPermissionError
          ? PROJECT_ERROR_MESSAGES.permissionError
          : PROJECT_ERROR_MESSAGES.moduleDeleteError;
        setToast({
          title: t(currentError.i18n_title),
          type: TOAST_TYPE.ERROR,
          message: currentError.i18n_message && t(currentError.i18n_message),
        });
      })
      .finally(() => handleClose());
  };

  return (
    <AlertModalCore
      handleClose={handleClose}
      handleSubmit={handleDeletion}
      isSubmitting={isDeleteLoading}
      isOpen={isOpen}
      title="Delete module"
      content={
        <>
          Are you sure you want to delete module-{" "}
          <span className="font-medium break-all text-primary">{data?.name}</span>? All of the data related to the
          module will be permanently removed. This action cannot be undone.
        </>
      }
    />
  );
});
