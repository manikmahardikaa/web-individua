import { MaterialYogaDataModel } from "@/app/model/material-yoga";
import { Modal } from "antd";

import { FormInstance } from "antd";
import MaterialYogaForm from "../../form/material-yoga";

export default function MaterialYogaModal({
  open,
  onClose,
  handleFinish,
  loadingCreate,
  loadingUpdate,
  form,
  type,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  handleFinish: (values: MaterialYogaDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<MaterialYogaDataModel>;
  type: "create" | "update";
  initialValues?: MaterialYogaDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Tambah Pekerjaan" : "Edit Pekerjaan"}
      footer={null}
      onCancel={onClose}
    >
      <MaterialYogaForm
        open={open}
        onFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        form={form}
        type={type}
        initialValues={initialValues}
      />
    </Modal>
  );
}
