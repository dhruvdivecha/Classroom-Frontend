import { useForm } from '@refinedev/react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreateView } from '@/components/refine-ui/views/create-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Textarea } from '@/components/ui/textarea';
import { useBack } from '@refinedev/core';
import { Loader2 } from 'lucide-react';
import { departmentSchema } from '@/lib/department-schema';
import { z } from 'zod';

const DepartmentsCreate = () => {
  const back = useBack();
  const form = useForm({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: { resource: 'departments', action: 'create' },
    defaultValues: { code: '', name: '', description: '' },
  });
  const { refineCore: { onFinish }, handleSubmit, formState: { isSubmitting }, control } = form;

  const onSubmit = async (values: z.infer<typeof departmentSchema>) => {
    try {
      await onFinish(values);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <CreateView>
      <Breadcrumb />
      <h1 className="page-title">Create Department</h1>
      <div className="intro-row">
        <p>Add a new department.</p>
        <Button onClick={() => back()}>Go Back</Button>
      </div>
      <Separator />
      <Card>
        <CardHeader><CardTitle>Department details</CardTitle></CardHeader>
        <Separator />
        <CardContent className="mt-4">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. CS" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Computer Science" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Optional description" {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Separator />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><span>Creating...</span><Loader2 className="ml-2 inline h-4 w-4 animate-spin" /></> : 'Create Department'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </CreateView>
  );
};

export default DepartmentsCreate;
