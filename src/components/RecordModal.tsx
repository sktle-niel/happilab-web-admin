import { Form, Modal } from "antd";
import { useEffect, type ReactNode } from "react";

type Props<T extends object> = {
  open: boolean;
  title: string;
  okText: string;
  initialValues: T;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (values: T) => void;
  children: ReactNode;
};

/** A small form in a modal: the fields come from the page, the saving and the busy state from the caller. */
export function RecordModal<T extends object>({ open, title, okText, initialValues, busy, onCancel, onSubmit, children }: Props<T>) {
  const [form] = Form.useForm<T>();

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues as never);
  }, [open, initialValues, form]);

  return (
    <Modal open={open} title={title} okText={okText} confirmLoading={busy} onCancel={onCancel} onOk={form.submit} destroyOnHidden>
      <Form<T> form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
        {children}
      </Form>
    </Modal>
  );
}
