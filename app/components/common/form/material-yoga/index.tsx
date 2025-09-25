import { MaterialYogaDataModel } from "@/app/model/material-yoga";
import SupaImageUploader from "@/app/utils/image-uploader";
import { Button, Form, Input, FormInstance, Checkbox } from "antd";
import { useEffect } from "react";

export default function MaterialYogaForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  open,
}: {
  onFinish: (values: MaterialYogaDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: MaterialYogaDataModel;
  form: FormInstance<MaterialYogaDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return; // only when modal is open
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Nama Materi Yoga"
        rules={[{ required: true, message: "Materi Yoga harus diisi" }]}
      >
        <Input placeholder="Tambahkan Nama Materi Yoga" size="large" />
      </Form.Item>
      <Form.Item
        name="link_url"
        label="Video"
        rules={[{ required: true, message: "Video harus diupload" }]}
      >
        <Input placeholder="Tambahkan Link Video" size="large" />
      </Form.Item>
      <Form.Item
        name="thumbnail"
        label="Pilih Thumbnail"
        rules={[{ required: true, message: "Thumbnail wajib diupload" }]}
      >
        <SupaImageUploader
          bucket="web-yoga"
          folder="thumbnails"
          label="Upload Thumbnail"
          previewStyle={{
            width: 240,
            maxHeight: 140,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      </Form.Item>
      <Form.Item name="description" label="Deskripsi">
        <Input.TextArea placeholder="Deskripsi" />
      </Form.Item>
      <Form.Item name="duration" label="Durasi">
        <Input placeholder="Tambahkan Durasi" size="large" />
      </Form.Item>
      <Form.Item name="is_active" valuePropName="checked">
        <Checkbox>
          Publish{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "#888",
            }}
          >
            * jika dicentang, maka materi yoga akan tampil di aplikasi
          </span>
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={type === "create" ? loadingCreate : loadingUpdate}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
